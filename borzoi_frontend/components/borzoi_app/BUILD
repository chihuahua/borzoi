package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")
load("@org_tensorflow_tensorboard//tensorboard/defs:vulcanize.bzl", "tensorboard_html_binary")

licenses(["notice"])  # Apache 2.0

ts_web_library(
    name = "borzoi_app",
    srcs = [
        "borzoi-app.html",
        "borzoi-app.ts",
    ],
    path = "/borzoi-frontend/components/borzoi-app",
    deps = [
        "//borzoi_frontend/components/genome_position_indicator",
        "//borzoi_frontend/components/genome_viewer",
        "//borzoi_frontend/ts_lib:camera",
        "//borzoi_frontend/ts_lib:data_manager",
        "//borzoi_frontend/ts_lib:data_requester",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    ],
)
