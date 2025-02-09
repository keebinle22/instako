# #Build the application
# FROM maven:3.8.1-openjdk-17 AS build
# WORKDIR /app
# COPY pom.xml .
# COPY src ./src
# RUN mvn clean install

# # Use an openjdk base image
#  FROM openjdk:17-jre-slim

#  # Set the working directory inside the container
#  WORKDIR /app

#  # Copy the jar file (assuming you have already built it with Maven/Gradle)
#  COPY /app/target/instako-0.0.1.jar ./instako-0.0.1.jar

#  # Expose the port the backend will run on
#  EXPOSE 8080

#  # Command to run the Spring Boot app
#  CMD ["java", "-jar", "instako-0.0.1.jar"]



#  Build the application
 FROM maven:3.8.1-openjdk-17 AS build
 WORKDIR /app
 COPY pom.xml .
 COPY src ./src
 RUN mvn clean install
 
 #Run the application
 FROM openjdk:17-oracle
 WORKDIR /app
COPY --from=build /app/target/instako-1.1.0.jar ./instako-1.1.0.jar
 EXPOSE 8080
CMD ["java", "-jar", "instako-1.1.0.jar"]
