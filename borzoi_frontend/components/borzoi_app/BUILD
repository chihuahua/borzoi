package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")
load("@org_tensorflow_tensorboard//tensorboard/defs:vulcanize.bzl", "tensorboard_html_binary")

licenses(["notice"])  # Apache 2.0

ts_web_library(
    name = "borzoi-app",
    srcs = [
        "borzoi-app.html",
        "borzoi-app.ts",
    ],
    path = "/borzoi-frontend/components/borzoi-app",
    deps = [
        "@org_tensorflow_tensorboard//tensorboard/components/tf_imports:polymer",
    ],
)
