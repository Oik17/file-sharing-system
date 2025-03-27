package utils

import (
	"io"
	"os"
	"path/filepath"
	"text/template"

	"github.com/labstack/echo/v4"
)

type Template struct {
	templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.templates.ExecuteTemplate(w, name, data)
}

func InitHTMLTemplate(e *echo.Echo) *Template {

	cwd, err := os.Getwd()
	if err != nil {
		e.Logger.Fatal(err)
	}

	templatesPath := filepath.Join(cwd, "templates", "*.html")

	t := &Template{
		templates: template.Must(template.ParseGlob(templatesPath)),
	}
	return t
}
