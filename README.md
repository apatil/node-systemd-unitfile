# systemd-unitfile

Converts folders containing systemd unit files to and from NodeJS objects. Converts this:

```javascript
{
  "hello.service": {
    Unit: {
      Description: "MyApp",
      After: "docker.service",
      Requires: "docker.service"
    },
    Service: {
      ExecStart: "/usr/bin/docker run busybox /usr/bin/echo Hello World"
      Type: "oneshot"
    }
  },
    "hello2.service": {
    Unit: {
      Description: "MyApp",
      After: "hello.service",
      Requires: "hello.service"
      Environment: ["MESSAGE_TARGET=World", "IMAGE=busybox"]
    },
    Service: {
      ExecStart: "/usr/bin/docker run -e MESSAGE_TARGET=$MESSAGE_TARGET $IMAGE /usr/binecho \"Hello Again $MESSAGE_TARGET\""
    }
  }
}
```

to these:

```
[Unit]
Description=MyApp
After=docker.service
Requires=docker.service

[Service]
ExecStart=/usr/bin/docker run busybox /usr/bin/echo "Hello World"
Type=oneshot
```

```
[Unit]
Description=MyApp Again
After=hello.service
Requires=hello.service
Environment="MESSAGE_TARGET=World"
Environment="IMAGE=busybox"

[Service]
ExecStart=/usr/bin/docker run -e MESSAGE_TARGET=$MESSAGE_TARGET $IMAGE /usr/binecho "Hello Again $MESSAGE_TARGET"
```

and back again. It can also read and write directories full of unit files.

## Why?

On [CoreOS](https://coreos.com), [fleet](https://coreos.com/docs/launching-containers/launching/launching-containers-fleet/) jobs are created by generating and submitting directories of unit files. It's OK to generate them as text files, but nicer to create them as objects and translate them to unit files at the last minute.

## What is the syntax of unit files?

Start [here](http://freedesktop.org/software/systemd/man/systemd.unit.html). This package won't check your unit files for validity (yet).

## Usage

```javascript
var su = require("systemd-unitfile");

// objRep will be an object representation of the ini files.
var objRep = su.parse("/path/to/unit/files/");
var newObjRep = transformation(objRep);

// iniRep will be an object mapping filenames to ini file contents.
var iniRep = su.dumps(newObjRep)
var singleIniFile = su.dumpsFile(newObjRep[serviceName]);

// su.write can take an object representation or an ini representation.
su.write("/path/to/new/unit/files/", iniRep);
```

## TODO

Check unit files for validity.