# Development

## Set Up
Install bazel, Google's open-source build tool. Instructions are [here](https://docs.bazel.build/versions/master/install.html).

Also install the following python dependencies.

* [pyfaidx](https://pypi.python.org/pypi/pyfaidx): Used for reading DNA sequences.
* [werkzeug](https://pypi.python.org/pypi/Werkzeug): Used for starting a WSGI-conformant web server.

## Local Development Server

To start a local server, `bazel run` the `backend:server` target from the repo directory with appropriate flags. This command starts a server at port 6042:

    bazel run backend:server -- \
      --fasta_location=~/Desktop/hg19/hg19.fa \
      --port=6042
    
