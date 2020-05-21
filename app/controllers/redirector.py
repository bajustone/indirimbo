import webapp2
import jinja2

class MainHander(webapp2.RequestHandler):
    def get(self):
        self.redirect("/indirimbo/", permanent=True)
app = webapp2.WSGIApplication([
    ('/indirimbo', MainHander ),
    ], debug=True)
