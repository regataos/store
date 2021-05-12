#!/bin/sh

cd /

while :
do

# This script checks the version of Snap apps and saves the information
# in the cache for the Regata OS app store.

# Update the cache with versions of the Snap apps
if test -e "/tmp/apps-scripts/update-snap-version-cache.txt" ; then
   rm -f "/tmp/apps-scripts/update-snap-version-cache.txt"

   if test ! -e "/tmp/regataos-store/config/snap-version-cache.txt" ; then
      sleep 5
   fi

   # Create cache directory with Snap apps versions
   if test ! -e "/tmp/regataos-store/config" ; then
	   mkdir -p "/tmp/regataos-store/config"
   fi

   # Check the version of Snap apps
	for i in /opt/regataos-store/apps-list/*.json; do
		app_name="$(grep -R '"nickname":' $i | awk '{print $2}' | sed 's/"\|,//g')"
		app_package_name="$(grep -R '"package":' $i | awk '{print $2}' | sed 's/"\|,//g')"
		package_manager="$(grep -R '"package_manager":' $i | awk '{print $2}' | sed 's/"\|,//g')"

		if [[ $(echo $package_manager) == *"snap"* ]]; then
        	app_on_list=$(grep -r $app_name "/tmp/regataos-store/config/snap-version-cache.txt")
        	if [[ $app_on_list != *"$app_name"* ]]; then
            snap_version=$(snap info $app_package_name | grep stable: | awk '{print $2}' | head -1 | tail -1)
            echo "$app_name $snap_version" >> /tmp/regataos-store/config/snap-version-cache.txt
         fi
		fi
	done

fi

   sleep 1
done
