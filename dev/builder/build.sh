#!/bin/bash
# Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
# For licensing, see LICENSE.md or http://ckeditor.com/license

# Build CKEditor using the default settings (and build.js)

set -e

echo "CKBuilder - Builds a release version of ckeditor-dev."
echo ""

CKBUILDER_VERSION="2.0.1"
CKBUILDER_URL="http://download.cksource.com/CKBuilder/$CKBUILDER_VERSION/ckbuilder.jar"

PROGNAME=$(basename $0)
MSG_UPDATE_FAILED="Warning: The attempt to update ckbuilder.jar failed. The existing file will be used."
MSG_DOWNLOAD_FAILED="It was not possible to download ckbuilder.jar"
ARGS=" $@ "

function error_exit
{
	echo "${PROGNAME}: ${1:-"Unknown Error"}" 1>&2
	exit 1
}

function command_exists
{
	command -v "$1" > /dev/null 2>&1;
}

function base_36 {
        b36arr=(0 1 2 3 4 5 6 7 8 9 A B C D E F G H I J K L M N O P Q R S T U V W X Y Z)
        for     i in $(echo "obase=36; $1"| bc)
        do      echo -n ${b36arr[${i#0}]}
        done
        echo
}

for part in $(date -u +"%y %m %d %H")
do
    SUFFIX_PARTS+=(`base_36 ${part}`)
done

SUFFIX=`echo ${SUFFIX_PARTS[*]} | tr -d ' '`;

if [ -d $1 ]; then
    rm -rf $1
fi

# Move to the script directory.
cd $(dirname $0)

# Download/update ckbuilder.jar
mkdir -p ckbuilder/$CKBUILDER_VERSION
cd ckbuilder/$CKBUILDER_VERSION
if [ -f ckbuilder.jar ]; then
	echo "Checking/Updating CKBuilder..."
	if command_exists curl ; then
	curl -O -R -z ckbuilder.jar $CKBUILDER_URL || echo "$MSG_UPDATE_FAILED"
	else
	wget -N $CKBUILDER_URL || echo "$MSG_UPDATE_FAILED"
	fi
else
	echo "Downloading CKBuilder..."
	if command_exists curl ; then
	curl -O -R $CKBUILDER_URL || error_exit "$MSG_DOWNLOAD_FAILED"
	else
	wget -N $CKBUILDER_URL || error_exit "$MSG_DOWNLOAD_FAILED"
	fi
fi
cd ../..

# Run the builder.
echo ""
echo "Starting CKBuilder..."

JAVA_ARGS=${ARGS// -t / } # Remove -t from arrgs

java -jar ckbuilder/$CKBUILDER_VERSION/ckbuilder.jar -s -d 1 --no-zip --no-tar --build ../../ release --version="4.4.7 Stable" --build-config build-config.js --overwrite $JAVA_ARGS

echo ""
echo "Suffixing icons.png in skins/moono/editor.css"
/bin/sed -i "s/icons\.png/icons\.png?t=${SUFFIX}/g" release/ckeditor/skins/moono/editor.css
/bin/sed -i "s/icons_hidpi\.png/icons_hidpi\.png?t=${SUFFIX}/g" release/ckeditor/skins/moono/editor.css

# Copy and build tests
if [[ "$ARGS" == *\ \-t\ * ]]; then
	echo ""
	echo "Coping tests..."

	cp -r ../../tests release/ckeditor/tests
	cp -r ../../package.json release/ckeditor/package.json
	cp -r ../../bender.js release/ckeditor/bender.js

	echo ""
	echo "Installing tests..."

	(cd release/ckeditor &&	npm install && bender init)
fi

echo ""
if [ $1 ]; then
    cp -rf release/ckeditor/ $1
    echo "Release created in \"${1}\""
else
    echo "Release created in the \"release\" directory."
fi
