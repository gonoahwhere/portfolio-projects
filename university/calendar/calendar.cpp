#include <string>
#include <iostream>
#include <iomanip> /* Provides formatting, useful for the calendar layout */
#include <ctime> /* Provides ability to use today's date */

using namespace std;

bool leapYearChecker(int year) { return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0); } /* Creates a True/False statement to check if year given is divisible by 4 or 400, but not by 100 (not all centuries aren't leap years!) */

int generateCorrectDay(int month, int year) {
	tm time_in = {}; /* Creates empty variables, used to correctly find the start day of the month */
	time_in.tm_year = year - 1900; /* Calculate how many years since 1900 */
	time_in.tm_mon = month - 1; /* Starts at 0, so September would be 8 */
	time_in.tm_mday = 1; /* First day of the month is always 1 */
	mktime(&time_in); /* Calculates the correct day of the week */
	return time_in.tm_wday; /* Returns the first weekday of the month, 1 would represent Monday */
}

void generateCalendar(int month, int year, int startDay, int highlightDay = 0) {
	string monthNames[] = { "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" }; /* Creates an array of the names for each month */
	int daysInMonth[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 }; /* Creates an array of the number of days in each month */
	if (leapYearChecker(year)) daysInMonth[1] = 29; /* Adds a 29th day to February for leap years */
	cout << "       " << monthNames[month - 1] << "  " << year << "\n---------------------------\nSun Mon Tue Wed Thu Fri Sat\n"; /* Prints month, year and shorthand names for the week */

	for (int i = 0; i < startDay; i++) { cout << "    "; } /* Prints spaces before the first day of the month */

	for (int day = 1; day <= daysInMonth[month - 1]; day++) { /* Generates the days, starting at 1 in a 7 day format */
		if (day == highlightDay) cout << "\033[33m" << setw(3) << day << "\033[0m "; /* Highlights the given day, or today if the user picked 'today' */
		else cout << setw(3) << day << " "; /* No highlight on other days */
		if ((day + startDay) % 7 == 0) cout << "\n";
	}
}

int checkIsInteger(const string& prompt, int min, int max) {
	int value;
	while (true) {
		cout << prompt;
		if (cin >> value && value >= min && value <= max) { return value; } /* Returns True and proceeds to next step */
		else { cout << "Invalid input! Please enter a number between " << min << " and " << max << ".\n"; cin.clear(); cin.ignore(10000, '\n'); } /* Clears invalid entry */
	}
};

bool validateChecker(int& day, int& month, int& year) { /* Checks if the user provides a valid month, year or day, if not allows a retry */
	int daysInMonth[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
	month = checkIsInteger("Enter a Month [1-12]: ", 1, 12); /* Only accepts 1-12 */
	year = checkIsInteger("Enter a Year [1970+]: ", 1970, 9999); /* Only accepts 1970 - 9999 */
	if (leapYearChecker(year)) daysInMonth[1] = 29;
	day = checkIsInteger("Enter a Day [1-" + to_string(daysInMonth[month - 1]) + "]: ", 1, daysInMonth[month - 1]); cout << "\n\n"; /* Only accepts 1-max days in month */
	int startDay = generateCorrectDay(month, year); /* Generates correct start day of the month */
	generateCalendar(month, year, startDay, day); /* Generates calendar for the given month/year */
	cout << "\n\n"; system("pause"); return true; /* Allows 'Press any key to continue... to be on a new line instead of next to the days */
}

bool todayDisplay(int& today, int& month, int& year) {
	time_t t = time(nullptr); /* Grabs the current time, in seconds since Jan 1st 1970 */
	tm now; /* holds the variables for local time */
	localtime_s(&now, &t); /* Converts the time in seconds so its readable, into yy/mm/dd /h/m/s */
	today = now.tm_mday; /* Calculates which date is today */
	month = now.tm_mon + 1; /* Allows month to start at 1 instead of 0, for 1 - 12 format */
	year = now.tm_year + 1900; /* Calculates how many years it has been since 1900, for accuracy */
	int startDay = generateCorrectDay(month, year);
	generateCalendar(month, year, startDay, today);
	cout << "\n\n"; system("pause"); return 0;
}

int main()
{
	string choice;
	int daysInMonth[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
	int today, month, year;
	cout << "Type 'today' to use today's date, or 'let me pick' to choose your own!\n"; /* Gives the user two choices */
	getline(cin, choice); /* Accepts string of text, rather than 1 word arguments */
	cout << "\n\n";
	int chosenDay;

	if (choice == "today") { todayDisplay(today, month, year); } /* Grabs today's date to display */
	if (choice == "let me pick") { validateChecker(chosenDay, month, year); } /* Sets the values user has chosen */
}
