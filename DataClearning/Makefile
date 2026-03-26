.PHONY: venv install activate dev freeze clean langchain api

# Setup
venv:
	python3 -m venv venv

install:
	./venv/bin/pip install -r requirements.txt

activate:
	source venv/bin/activate
# Dev
dev:
	./venv/bin/python -m API.Main

# Utilities
freeze:
	./venv/bin/pip freeze > requirements.txt

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +


#some custom commands

langchain:
	zsh -c "source venv/bin/activate && cd worldOfRag/langchain && exec zsh"

api:
	zsh -c "source venv/bin/activate  && cd API && exec zsh"
