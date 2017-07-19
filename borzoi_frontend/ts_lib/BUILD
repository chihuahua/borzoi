package(default_visibility = ["//visibility:public"])

load("@org_tensorflow_tensorboard//tensorboard/defs:web.bzl", "ts_web_library")

ts_web_library(
    name = "camera",
    srcs = [
        "camera.html",
        "camera.ts",
    ],
    path = "/borzoi-frontend/ts_lib",
    deps = [
      ":event",
      ":event_target",
    ],
)

ts_web_library(
    name = "data_manager",
    srcs = [
        "data-manager.html",
        "data-manager.ts",
    ],
    path = "/borzoi-frontend/ts_lib",
    deps = [
      ":event",
      ":event_target",
    ]
)

ts_web_library(
    name = "data_requester",
    srcs = [
        "data-requester.html",
        "data-requester.ts",
    ],
    path = "/borzoi-frontend/ts_lib",
    deps = [
      ":camera",
      ":data_manager",
      ":event",
      ":event_target",
    ]
)

ts_web_library(
    name = "drag",
    srcs = [
        "drag.html",
        "drag.ts",
    ],
    path = "/borzoi-frontend/ts_lib",
    deps = [
      ":camera",
      ":data_manager",
      ":event",
      ":event_target",
    ]
)

ts_web_library(
    name = "event_target",
    srcs = [
        "event-target.html",
        "event-target.ts",
    ],
    path = "/borzoi-frontend/ts_lib",
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
    path = "/borzoi-frontend/ts_lib",
)