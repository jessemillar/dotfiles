According to my coworker/my experience, a `Standard B4ms` (4 vcpus, 16 GiB memory) VM with a 60 GB premium SSD runs about $130/month.

You probably want an attached disk dedicated to Docker so you don't run out of OS-space follow this guide to attach a disk and set up the file system:
https://docs.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal

> Check that `/dev/sdc1` is the correct disk
```
lsblk -o KNAME,TYPE,SIZE,MODEL
```

[Set `DOCKER_HOST` on the machine that'll be connecting to the remote Docker daemon.](https://www.digitalocean.com/community/tutorials/how-to-use-a-remote-docker-server-to-speed-up-your-workflow)
