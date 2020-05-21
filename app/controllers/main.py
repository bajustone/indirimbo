import webapp2
import jinja2
import hashlib
import re
import infrastructures.filters as filters

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(''),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True
    )
JINJA_ENVIRONMENT.filters["add_hash"] = filters.add_hash

class MainHander(webapp2.RequestHandler):
    def get(self, url):
        template_info = filters.get_template_info(url)

        BOOK = self.request.get('book')

        if BOOK=="":
            BOOK = "GUSAG"


        content_type = "text/plain"
        response = {
            'code': 404,
            'content': ""
            }

        if template_info["mimetype"][0]:
            content_type = "%s; charset=utf-8" % template_info["mimetype"][0]

        try:
            template = JINJA_ENVIRONMENT.get_template(template_info['path'])
            response['content'] = template.render(
                url = url,
                book = BOOK
                )
            response['code'] = 200
        except Exception as e:
            template = JINJA_ENVIRONMENT.get_template('/views/404.html')
            response['content'] = template.render(
                url = url
                )
            print e

        etag = hashlib.sha256()
        etag.update(response["content"].encode('utf-8'))

        self.response.status = response['code']
        self.response.headers["Content-Type"] = content_type
        self.response.headers["ETag"] = etag.hexdigest()
        self.response.headers["Cache-Control"] = template_info["cache"]
        self.response.write(response['content'])
app = webapp2.WSGIApplication([
    ('/indirimbo/?(.*)', MainHander ),
    ], debug=True)
