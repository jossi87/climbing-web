import React from "react";
import { Segment } from "semantic-ui-react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const Swagger = () => {
  return (
    <Segment>
      {/* @ts-expect-error - the @types/swagger-ui-react package is old */}
      <SwaggerUI url="https://brattelinjer.no/com.buldreinfo.jersey.jaxb/swagger.json" />
    </Segment>
  );
};

export default Swagger;
