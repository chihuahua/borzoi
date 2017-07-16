"""A WSGI server that can be passed to werkzeug."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import json
import logging
import os
from werkzeug import wrappers

import six
from six.moves.urllib import parse as urlparse


class BorzoiWSGI(object):
  def __init__(self, genome_reader):
    """Constructs an app that can be passed to werkzeug.

    genome_reader:
      A genome reader. Used to quickly obtain subsequences.
    """
    self._genome_reader = genome_reader
    self.data_applications = {
      '/': self._serve_home_page,
      '/contigs': self._serve_contigs,
      '/subsequence': self._serve_subsequence,
    }

  @wrappers.Request.application
  def _serve_contigs(self, request):
    """Serves a list of all contigs and their lengths.

    Args:
      request: The werkzeug.Request object.

    Returns:
      A werkzeug.Response object.
    """
    data = []
    for contig in self._genome_reader.get_contigs():
      data.append({
        'name': contig,
        'length': self._genome_reader.get_contig_length(contig),
      })
    return wrappers.Response(
        response=json.dumps(data), status=200, content_type='application/json')

  @wrappers.Request.application
  def _serve_home_page(self, request):
    """Serves the home page.

    Args:
      request: The werkzeug.Request object.

    Returns:
      A werkzeug.Response object.

    Raises:
      IOError: If reading from disk fails.
    """
    root_directory = os.path.join(os.path.dirname(__file__), os.pardir)
    path = os.path.join(root_directory, 'borzoi_frontend', 'server.html')
    # raise ValueError(path + ' ' + `os.listdir(path)`)
    with open(os.path.abspath(path), 'rb') as f:
      return wrappers.Response(
          response=f.read(), status=200, content_type='text/html')

  @wrappers.Request.application
  def _serve_subsequence(self, request):
    """Serves a subsequence.

    Args:
      request: The werkzeug.Request object.

    Returns:
      A werkzeug.Response object.
    """
    contig = request.args.get('contig')
    start_index_string = request.args.get('start_index')
    length_string = request.args.get('length')

    if not contig or not start_index_string or not length_string:
      logging.error(
          'Not all values provided: %s, %s, %s',
          contig, start_index_string, length_string)
      return wrappers.Response(
          response='', status=500, content_type='text/plain')

    try:
      start_index = int(start_index_string)
      length = int(length_string)
    except ValueError as err:
      logging.error(
        'error while parsing %s and %s: %r',
        start_index_string,
        length_string,
        err)
      return wrappers.Response(
          response='', status=500, content_type='text/plain')

    try:
      sequence = self._genome_reader.get_subsequence(
          contig, start_index, start_index + length)
    except ValueError as err:
      logging.error('error while reading the subsequence: %r', err)
      return wrappers.Response(
          response='', status=500, content_type='text/plain')

    data = {
      'contig': contig,
      'sequence': sequence,
      'start_index': start_index,
    }
    return wrappers.Response(
        response=json.dumps(data), status=200, content_type='application/json')

  @wrappers.Request.application
  def _handler_for_404s(self, request):
    """Handles 404s.

    Returns:
      A werkzeug.Response object.
    """
    return wrappers.Response(
        response='', status=404, content_type='text/plain')

  def _clean_path(self, path):
    """Removes trailing slash if present, unless it's the root path."""
    if len(path) > 1 and path.endswith('/'):
      return path[:-1]
    return path

  def __call__(self, environ, start_response):  # pylint: disable=invalid-name
    """Central entry point for the TensorBoard application.

    This method handles routing to sub-applications. It does simple routing
    using regular expression matching.

    This __call__ method conforms to the WSGI spec, so that instances of this
    class are WSGI applications.

    Args:
      environ: See WSGI spec.
      start_response: See WSGI spec.

    Returns:
      A werkzeug Response.
    """
    request = wrappers.Request(environ)
    parsed_url = urlparse.urlparse(request.path)
    clean_path = self._clean_path(parsed_url.path)
    # pylint: disable=too-many-function-args
    if clean_path in self.data_applications:
      return self.data_applications[clean_path](environ, start_response)
    else:
      logging.error('path %s not found, sending 404', clean_path)
      return self._handler_for_404s(environ, start_response)
    # pylint: enable=too-many-function-args

