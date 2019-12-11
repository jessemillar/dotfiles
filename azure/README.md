Standard B4ms (4 vcpus, 16 GiB memory) with a 60gb premium ssd
runs about $130/month

You probably want an attached disk dedicated to Docker so you don't run out of OS-space
follow this guide to attach a disk and set up the filesystem
https://docs.microsoft.com/en-us/azure/virtual-machines/linux/attach-disk-portal

> Check that `/dev/sdc1` is the correct disk
```
lsblk -o KNAME,TYPE,SIZE,MODEL
```

## Mount the Disk
```
sudo mkdir /mnt/docker
sudo mount /dev/sdc1 /mnt/docker
```

Place `daemon.json` in `/etc/docker/daemon.json` and restart the Docker service
