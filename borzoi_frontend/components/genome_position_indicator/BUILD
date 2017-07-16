package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")

licenses(["notice"])  # Apache 2.0

ts_web_library(
    name = "genome_position_indicator",
    srcs = [
        "genome-position-indicator.html",
        "genome-position-indicator.ts",
    ],
    path = "/borzoi-frontend/components/genome-position-indicator",
    deps = [
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    ],
)