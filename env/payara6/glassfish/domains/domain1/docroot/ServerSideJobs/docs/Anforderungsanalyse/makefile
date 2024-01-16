NAME=Anforderungsanalyse

.PHONY: all clean distclean zip

all: usecases.tex Sequenzdiagramm.png
	pdflatex --shell-escape "$(NAME).tex"
	pdflatex --shell-escape "$(NAME).tex"
	pdflatex --shell-escape "$(NAME).tex"
clean:
	@echo "Cleaning up..."
	rm -rf _markdown_*
	rm -f *.aux *.log *.in *.lua *.out *.toc Sequenzdiagramm.png
	rm -f usecases.tex
	@echo "Clean."

distclean: clean
	rm -f "$(NAME).pdf"

usecases.tex: ../usecases.md
	echo "\begin{markdown}" > usecases.tex
	cat ../usecases.md >> usecases.tex
	echo "\end{markdown}" >> usecases.tex

Sequenzdiagramm.png: Sequenzdiagramm.svg
	convert $< Sequenzdiagramm.png
