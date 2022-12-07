import { UnauthorizedException } from "@nestjs/common";
import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";

export const validatorDto = async <T extends ClassConstructor<any>>(
	dto: T,
	obj: Object,
	myMessage: string
  ) => {
	// tranform the literal object to class object
	const objInstance = plainToClass(dto, obj);
	// validating and check the errors, throw the errors if exist
	const errors = await validate(objInstance);
	// errors is an array of validation errors
	if (errors.length > 0) {
	  /*throw new TypeError(
		`validation failed. The error fields : ${errors.map(
		  ({ property }) => property
		)}`
	  );*/
	  throw new UnauthorizedException(myMessage);
	}
  };