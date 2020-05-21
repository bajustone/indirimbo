#!/usr/bin/env python2
#
import re
import hashlib
import string
import mimetypes

def add_hash(path):
    """Generates a hash from a file.

    Args:
      path: (string) The path to the file to generate the hash from.

    Returns:
      Returns a hash digest (string) of the file.
    """
    blocksize = 32768
    file_hash = hashlib.sha256()
    file_path = re.sub(r'/indirimbo/', './', path)

    print "File path here"
    print file_path

    with open(file_path) as file_to_hash:
        file_buffer = file_to_hash.read(blocksize)
        while (len(file_buffer) > 0):
            file_hash.update(file_buffer)
            file_buffer = file_to_hash.read(blocksize)

    return re.sub(r'(.*?)\.(.*)$', ("\\1.%s.\\2" % file_hash.hexdigest()), path)


def get_template_info(url):
    _SERVICE_WORKER_PATH = "/static/sw.js"
    template_info = {
        "path": url,
        "mimetype": (None, None),
        # Static files can be cached for a year, since there are hashes to
        # track changes to files, and so on. And we don't cache HTML.
        "cache": "public, max-age=31536000"
    }


    # If this is not a static file, use a template.
    if re.search(r"^static/", url) is None:

        if re.search(r"^$", url):
            url = url + "index"
        # print "requested url" + url

        template_info["path"] = "/views/" + url + ".html"

        # HTML files should expire immediately.
        template_info["cache"] = "private, no-cache"

    # Strip off the hash from the path we're looking for.
    template_info["path"] = re.sub(r'[a-f0-9]{64}.', '', template_info["path"])

    # Make a special exception for the Service Worker, since we serve it
    # from /bon/sw.js, even though the file lives elsewhere.
    if re.search("sw.js$", url) is not None:
        print "Service url"
        template_info["path"] = _SERVICE_WORKER_PATH

    print template_info["path"]



    template_info["mimetype"] = mimetypes.guess_type(template_info["path"])

    # print "Mine type:"
    # print template_info["mimetype"]

    return template_info
