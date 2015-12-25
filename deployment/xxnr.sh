#!/bin/sh
#
# xxnr Open source remote desktop protocol (RDP) server
#
# chkconfig:   - 64 36
# description: Open source remote desktop protocol (RDP) server
#

## tr -d '\r' < xxnr.sh > /etc/init.d/xxnr
## service xxnr start
## chkconfig xxnr on -- automatically start service when machine is restarted

### BEGIN INIT INFO
# Provides: xxnr
# Required-Start: $network
# Required-Stop: $network
# Should-Start: $network
# Should-Stop: $network
# Default-Start:
# Default-Stop:
# Short-Description: Starts the xxnr daemon
# Description:  Open source remote desktop protocol (RDP) server
### END INIT INFO

# Source function library.
. /etc/rc.d/init.d/functions

# Check that networking is up.
[ "${NETWORKING}" = "no" ] && exit 0

[ -e /etc/sysconfig/xxnr ] && . /etc/sysconfig/xxnr

start_xxnr() {
    exec="/root/xxnr/v2.0/node-v4.1.1/node-v4.1.1-linux-x64/bin/node"
    xxnr_OPTIONS="debug.js"
	xxnr_WORKING_DIRECTORY="/root/xxnr/v2.0/website"
    prog="node"
    lockfile=/var/lock/subsys/xxnr
    [ -x $exec ] || exit 5
    echo -n $"Starting $prog: "
	export NODE_PATH=$NODE_PATH:$xxnr_WORKING_DIRECTORY
	echo "NODE_PATH = $NODE_PATH"
	cd $xxnr_WORKING_DIRECTORY
	echo "Creating daemon ..."
    daemon "$exec $xxnr_OPTIONS >> /root/xxnr/service.log"
    retval=$?
    echo
    [ $retval -eq 0 ] && touch $lockfile
    return $retval
}

stop_xxnr() {
    prog="xxnr"
    lockfile=/var/lock/subsys/xxnr
    echo -n $"Stopping $prog: "
    killproc $prog
    retval=$?
    echo
    [ $retval -eq 0 ] && rm -f $lockfile
    return $retval
}

start() {
    start_xxnr
}

stop() {
    stop_xxnr
}

restart() {
    stop_xxnr
    start_xxnr
}

reload() {
    restart
}

force_reload() {
    restart
}

rh_status() {
    prog="xxnr"
    status $prog
    status $prog
}

rh_status_q() {
    rh_status >/dev/null 2>&1
}


case "$1" in
    start)
        rh_status_q && exit 0
        $1
        ;;
    stop)
        rh_status_q || exit 0
        $1
        ;;
    restart)
        $1
        ;;
    reload)
        rh_status_q || exit 7
        $1
        ;;
    force-reload)
        force_reload
        ;;
    status)
        rh_status
        ;;
    condrestart|try-restart)
        rh_status_q || exit 0
        restart
        ;;
    *)
        echo $"Usage: $0 {start|stop|status|restart|condrestart|try-restart|reload|force-reload}"
        exit 2
esac
exit $?

