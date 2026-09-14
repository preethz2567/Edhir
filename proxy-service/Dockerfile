FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Build SDK first
COPY edhir-java-sdk/pom.xml edhir-java-sdk/
COPY edhir-java-sdk/src edhir-java-sdk/src
RUN mvn -f edhir-java-sdk/pom.xml clean install -DskipTests

# Build proxy-service
COPY proxy-service/pom.xml proxy-service/
COPY proxy-service/src proxy-service/src
RUN mvn -f proxy-service/pom.xml clean package -DskipTests
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/proxy-service/target/proxy-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
