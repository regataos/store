#!/bin/bash

echo -e "Update Updating the software repositories cache...\n"
sudo zypper --non-interactive refresh

user=$(users | awk '{print $1}')

for i in /home/$user/develop/store/opt/regataos-store/apps-list/*.json; do
    app_nickname="$(grep -R '"nickname"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    file_download="$(grep -R '"package"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    architecture="$(grep -R '"architecture"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    download_link="$(grep -R '"download_link"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    repo_name="$(grep -R '"repository_name"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    repoUrl="$(grep -R '"repository_url"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"
    ifRPM="$(grep -R '"package_manager"' $i | cut -d'"' -f 4- | cut -d'"' -f -1 | head -1 | tail -2)"

    if [[ $ifRPM == *"zypper"* ]]; then
        if [[ $repoUrl == *"[mainRepositoryUrl]"* ]]; then
            repo_link="$(grep -r mainRepositoryUrl= /usr/share/regataos/regataos-base-version.txt | cut -d'=' -f 2-)/$architecture"

        elif [[ $repoUrl == *"[basedOnVersion]"* ]]; then
            basedOnVersion="$(grep -r basedOnVersion= /usr/share/regataos/regataos-base-version.txt | cut -d'=' -f 2-)"
            repo_link=$(echo $repoUrl | sed "s,\[basedOnVersion\],$basedOnVersion,")

        elif [[ $repoUrl == *"[basedOn]"* ]]; then
            basedOn="$(grep -r basedOn= /usr/share/regataos/regataos-base-version.txt | cut -d'=' -f 2-)"
            repo_link=$(echo $repoUrl | sed "s,\[basedOn\],$basedOn,")

        else
            repo_link="$repoUrl"
        fi

        # Add repo for app
        if [ ! -z $repo_name ]; then
            rm -f "/etc/zypp/repos.d/$repo_name.repo"

            if test ! -e "/etc/zypp/repos.d/$repo_name.repo"; then
                # Check repository format
                if [[ $repo_link == *"stable/x86_64"* ]]; then
                    repo_format="format_1"

                elif [[ $repo_link == *"binary-x86_64"* ]]; then
                    repo_format="format_1"

                elif [[ $repo_link == *"archive/rpm/x86_64"* ]]; then
                    repo_format="format_1"

                elif [[ $repo_link == *".com/x86_64"* ]]; then
                    repo_format="format_1"

                else
                    repo_format="format_2"
                fi

                if [[ $(echo $repo_format) == *"format_1"* ]]; then
                    cat >"/etc/zypp/repos.d/$repo_name.repo" <<REPOCONTENT
[$repo_name]
name=$repo_name
baseurl=$repo_link
enabled=1
autorefresh=0
gpgcheck=0
keeppackages=0
type=rpm-md
REPOCONTENT

                elif [[ $(echo $repo_format) == *"format_2"* ]]; then
                    cat >"/etc/zypp/repos.d/$repo_name.repo" <<REPOCONTENT
[$repo_name]
name=$repo_name
baseurl=$(echo $repo_link | sed 's/x86_64//' | sed 's/noarch//')
enabled=1
autorefresh=0
gpgcheck=0
keeppackages=0
type=rpm-md
REPOCONTENT

                else
                    cat >"/etc/zypp/repos.d/$repo_name.repo" <<REPOCONTENT
[$repo_name]
name=$repo_name
baseurl=$(echo $repo_link | sed 's/x86_64//' | sed 's/noarch//')
enabled=1
autorefresh=0
gpgcheck=0
keeppackages=0
type=rpm-md
REPOCONTENT
                fi

                echo -e "Update Updating the software repositories cache...\n"
                sudo zypper --non-interactive refresh $repo_name
            fi
        fi

        #Link download
        if [ -z $download_link ]; then
            version=$(zypper info $file_download | grep Ver | awk '{print $3}' | head -1 | tail -1)
            app_download_file_name="$file_download-$version.$architecture.rpm"
            app_download_link="$repo_link/$app_download_file_name"

            url1="$app_download_link"

            wget --spider "$app_download_link"
            if [ $? != 0 ]; then
                app_download_file_name="$file_download"_"$version.$architecture.rpm"
                app_download_link="$repo_link/$app_download_file_name"

                url2="$app_download_link"

                wget --spider "$app_download_link"
                if [ $? != 0 ]; then
                    echo "Error for $app_nickname"
                    echo "Error for $app_nickname: $app_download_link" >>/home/$user/test-link-error.txt
                    echo "url1=$url1" >>/home/$user/test-link-error.txt
                    echo "url2=$url2" >>/home/$user/test-link-error.txt
                fi
            fi

        elif [[ $download_link == *"undefined"* ]]; then
            version=$(zypper info $file_download | grep Ver | awk '{print $3}' | head -1 | tail -1)
            app_download_file_name="$file_download-$version.$architecture.rpm"
            app_download_link="$repo_link/$app_download_file_name"

            url1="$app_download_link"

            wget --spider "$app_download_link"
            if [ $? != 0 ]; then
                app_download_file_name="$file_download"_"$version.$architecture.rpm"
                app_download_link="$repo_link/$app_download_file_name"

                url2="$app_download_link"

                wget --spider "$app_download_link"
                if [ $? != 0 ]; then
                    echo "Error for $app_nickname"
                    echo "Error for $app_nickname: $app_download_link" >>/home/$user/test-link-error.txt
                    echo "url1=$url1" >>/home/$user/test-link-error.txt
                    echo "url2=$url2" >>/home/$user/test-link-error.txt
                fi
            fi

        else
            version=$(zypper info $file_download | grep Ver | awk '{print $3}' | head -1 | tail -1 | sed "s/-0//")
            app_download_link=$(echo $download_link | sed "s/\[version\]/$version/")

            wget --spider "$app_download_link"
            if [ $? != 0 ]; then
                echo "Error for $app_nickname"
                echo "Error for $app_nickname: $app_download_link" >>/home/$user/test-link-error.txt
            fi
        fi
    fi

done

echo -e "\nVerification completed!\n" >>/home/$user/test-link-error.txt
echo -e "\nVerification completed!\n"
