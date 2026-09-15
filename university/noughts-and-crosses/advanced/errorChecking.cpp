#include <iostream>
#include <string>

using namespace std;

extern string errorMessage;
extern string ERRORS;
extern string RESET;

void errorChecking() {
    if (!errorMessage.empty()) {
        cout << ERRORS << errorMessage << RESET; /* Prints error under game */
        errorMessage = ""; /* Resets after printing to prevent issues reuing */
    }
}