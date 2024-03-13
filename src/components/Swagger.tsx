import React from "react";
import { Segment } from "semantic-ui-react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const Swagger = () => {
  return (
    <Segment>
      <SwaggerUI url="https://brattelinjer.no/com.buldreinfo.jersey.jaxb/openapi.json" />
    </Segment>
  );
};

export default Swagger;
