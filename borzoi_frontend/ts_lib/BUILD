package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")

ts_web_library(
    name = "event_target",
    srcs = [
        "event-target.html",
        "event-target.ts",
    ],
    path = "/borzoi-frontend/lib",
    deps = [
      ":event",
    ]
)


ts_web_library(
    name = "event",
    srcs = [
        "event.html",
        "event.ts",
    ],
    path = "/borzoi-frontend/lib",
)