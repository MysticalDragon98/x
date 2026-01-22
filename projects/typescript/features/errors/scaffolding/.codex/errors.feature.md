# Errors

1) The project way to throw errors are via the CustomError class
2) All errors must be thrown using $assert(assertion, CustomError)
3) CustomErrors are normally initialized locally via a 
```
const Errors = CustomErrors({
    ErrorCode: (...args) => `Constructed error message`
});
```