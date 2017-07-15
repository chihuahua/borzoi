py_binary(
    name = "borzoi_wsgi",
    srcs = [
        "borzoi_wsgi.py",
    ],
    srcs_version = "PY2AND3",
    deps = [
        "@six_archive//:six",
    ],
)

py_binary(
    name = "genome_reader",
    srcs = [
        "genome_reader.py",
    ],
    srcs_version = "PY2AND3",
)

py_binary(
    name = "server",
    srcs = [
        "server.py",
    ],
    srcs_version = "PY2AND3",
    deps = [
        ":borzoi_wsgi",
        ":genome_reader",
        "@com_github_google_python_gflags//:gflags",
    ],
)
