.PHONY: run build package install test clean rebuild

default: run

run: install
	mvn spring-boot:run

build: package

package:
	mvn -DskipTests package

install:
	mvn -DskipTests install

test:
	mvn test

clean:
	mvn clean

rebuild: clean package


