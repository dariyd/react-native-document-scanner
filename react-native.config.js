module.exports = {
  dependency: {
    platforms: {
      android: {
        // This is a Java-only TurboModule - no C++ codegen needed
        // Setting cmakeListsPath to null tells autolinking to skip C++ setup
        cmakeListsPath: null,
      },
      ios: {
        // iOS uses Objective-C++ and needs codegen - use defaults
      },
    },
  },
};

