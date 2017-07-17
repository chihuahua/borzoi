"""Starts a server for borzoi."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import logging
import os
import socket
import sys
from werkzeug import serving

import gflags

from backend import borzoi_wsgi
from backend import genome_reader

gflags.DEFINE_string(
    'fasta_location',
    '',
    'Required. The location of the FASTA file to read. If a FAI file does not '
    'exist alongside the FASTA file (in its same directory), then a FAI file '
    'will be generated before the FASTA file is ever read.')

gflags.DEFINE_string(
    'host', '', 'What host to listen to. Defaults to '
    'serving on all interfaces, set to 127.0.0.1 (localhost) to'
    'disable remote access (also quiets security warnings).')

gflags.DEFINE_integer('port', 6042, 'What port to serve on.')

FLAGS = gflags.FLAGS


def create_app():
  """Creates an app.

  Returns:
    An application object that can be passed to werkzeug.
  """
  return borzoi_wsgi.BorzoiWSGI(
      genome_reader.GenomeReader(os.path.expanduser(FLAGS.fasta_location)))


def make_simple_server(borzoi_app, host, port):
  """Creates an HTTP server.

  Args:
    borzoi_app: The WSGI application to create a server for.
    host: Indicates the interfaces to bind to ('::' or '0.0.0.0' for all
        interfaces, '::1' or '127.0.0.1' for localhost). A blank value ('')
        indicates protocol-agnostic all interfaces.
    port: The port to bind to (0 indicates an unused port selected by the
        operating system).
  Returns:
    A tuple of (server, url):
      server: An HTTP server object configured to host this service.
      url: A best guess at a URL where the app will be accessible once the
        server has been started.
  Raises:
    socket.error: If a server could not be constructed with the host and port
      specified. Also logs an error message.
  """
  try:
    if host:
      # The user provided an explicit host
      server = serving.make_server(host, port, borzoi_app, threaded=True)
      if ':' in host and not host.startswith('['):
        # Display IPv6 addresses as [::1]:80 rather than ::1:80
        final_host = '[{}]'.format(host)
      else:
        final_host = host
    else:
      # We've promised to bind to all interfaces on this host. However, we're
      # not sure whether that means IPv4 or IPv6 interfaces.
      try:
        # First try passing in a blank host (meaning all interfaces). This,
        # unfortunately, defaults to IPv4 even if no IPv4 interface is available
        # (yielding a socket.error).
        server = serving.make_server(host, port, borzoi_app, threaded=True)
      except socket.error:
        # If a blank host didn't work, we explicitly request IPv6 interfaces.
        server = serving.make_server('::', port, borzoi_app, threaded=True)
      final_host = socket.gethostname()
    server.daemon_threads = True
  except socket.error as socket_error:
    if port == 0:
      msg = 'Unable to find any open port'
    else:
      msg = 'Attempted to bind to port %d, but it was already in use' % port
    logging.error(msg)
    raise socket_error

  final_port = server.socket.getsockname()[1]
  serving_url = 'http://%s:%d' % (final_host, final_port)
  return server, serving_url


def run_simple_server(borzoi_app, host, port):
  """Run an HTTP server, and print some messages to the console.

  Args:
    borzoi_app: The app to serve.
    host: The host (could optionally be the empty string).
    port: The port.
  """
  try:
    server, url = make_simple_server(borzoi_app, FLAGS.host, FLAGS.port)
  except socket.error:
    # An error message was already logged
    # TODO(@jart): Remove log and throw anti-pattern.
    sys.exit(-1)

  start_server_message = 'Started server at %s (Press CTRL+C to quit) ' % url
  logging.info(start_server_message)
  server.serve_forever()


def main(flags, argv):
  del argv  # Unused.

  app = create_app()
  run_simple_server(app, FLAGS.host, FLAGS.port)


if __name__ == '__main__':
  unused_argv = FLAGS(sys.argv)
  main(FLAGS, unused_argv)
