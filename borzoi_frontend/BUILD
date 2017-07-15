package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")
load("@org_tensorflow_tensorboard//tensorboard/defs:vulcanize.bzl", "tensorboard_html_binary")

licenses(["notice"])  # Apache 2.0

ts_web_library(
    name = "borzoi_main",
    srcs = [
        "borzoi-main.html",
    ],
    path = "/borzoi-frontend/borzoi-main",
    deps = [
        "//borzoi_frontend/components/borzoi_app:borzoi_app",
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    ],
)

tensorboard_html_binary(
    name = "server",
    input_path = "/borzoi-frontend/borzoi-main/borzoi-main.html",
    output_path = "/borzoi-frontend/borzoi-main/server.html",
    deps = [":borzoi_main"],
)
