migrate:
	poetry run alembic revision --autogenerate  -m "New migration" && \
	poetry run alembic upgrade head 
run: 
	poetry run python3 -m uvicorn main:app --reload --port 5001
setup:
	./setup.sh
