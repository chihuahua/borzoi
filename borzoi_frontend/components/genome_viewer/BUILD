package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")

licenses(["notice"])  # Apache 2.0

ts_web_library(
    name = "genome_viewer",
    srcs = [
        "genome-viewer.html",
        "genome-viewer.ts",
    ],
    path = "/borzoi-frontend/components/genome-viewer",
    deps = [
        "//borzoi_frontend/ts_lib:camera",
        "//borzoi_frontend/ts_lib:data_manager",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    ],
)
