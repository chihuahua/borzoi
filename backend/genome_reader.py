"""Reads subsequences from a FASTA file."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import pyfaidx


class GenomeReader(object):
  def __init__(self, fasta_location):
    """Constructs a genome reader, which can quickly access subsequences.

    Args:
      fasta_location: The absolute location of the FASTA file.
    """
    # This generates a FAI file of the same name (but different extension) if
    # one does not exist in the same directory as the FASTA file.
    self._genes_reader = pyfaidx.Fasta(fasta_location)

  def get_subsequence(self, contig, begin, end):
    """Obtains a subsequence DNA string.

    Args:
      contig: The string name of the contig.
      begin: The begin index of the subsequence.
      end: The exclusive end index of the subsequence.

    Returns:
      A subsequence string.

    Raises:
      ValueError: If any index is out of range.
    """
    sequence_length = self.get_contig_length(contig)
    if begin < 0 or end > sequence_length:
      raise ValueError('%r is out of range. %s is %d bp long.' % (
          (begin, end), contig, sequence_length))

    return self._genes_reader[contig][begin:end].seq

  def get_contig_length(self, contig):
    """Gets the length of a contig

      Args:
        contig: The string name of the contig.

      Returns:
        The length (in bp) of the contig.

      Raises:
        KeyError: If the contig does not exist.
    """
    return len(self._genes_reader[contig])

  def get_contigs(self):
    """Gets all contigs.

    Returns:
      A string list of all contigs.
    """
    return self._genes_reader.keys()
