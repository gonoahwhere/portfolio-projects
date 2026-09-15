#include <iostream>
#include <string>

using namespace std;

extern char input;
extern bool isGameActive;
extern bool exitGame;
extern string errorMessage;
extern string TITLE;
extern string ERRORS;
extern string TIE;
extern string BACK;
extern string RESET;
extern string SUB;
extern string PLAYER1;
extern string PLAYER2;
extern string p1name;
extern string p2name;
extern string p1piece;
extern string p2piece;
extern bool pieceSelect;

void replayGame(); /* Loads from replayGame.cpp */
void createGrid(); /* Loads from createGrid.cpp */
void turnTaking(); /* Loads from turnTaking.cpp */
void errorChecking(); /* Loads from errorChecking.cpp */
void isGameOver(); /* Loads from isGameOver.cpp */
void showTitleScreen(); /* Loads from titleMenu.cpp */
void showInstructions(); /* Loads from instructions.cpp */
void redrawEndGame(); /* Loads from replayGame.cpp */
void showStats(); /* Loads from stats.cpp */
void pieces(); /* Loads from pieceOptions.cpp */
void showSettings(); /* Loads from settings.cpp */
void savingData(); /* Loads from saving.cpp */
void loadingData(); /* Loads from loading.cpp */

int main() {
	while (!exitGame) {
        loadingData(); 
		showTitleScreen();
		errorChecking();

		cin >> input;

		switch (input) {
        case 'p': {
            while (true) {
                system("clear");
                cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
                
                replayGame(); /* resets board for new game */
                isGameActive = true;

                /* Game is still running */
                while (isGameActive) {
                    createGrid();
                    errorChecking();
                    turnTaking();
                    isGameOver();
                }

                bool waitingForInput = true;
                while (waitingForInput) {
                    redrawEndGame();

                    /* Tells user to press R, B or Q one of the following steps */
                    cout << "\n  Press " << TIE << "[R]" << RESET << " to replay, " << BACK << "[B]" << RESET << " to go back to title screen or " << ERRORS << "[Q]" << RESET << " to quit: ";
                    if (!errorMessage.empty()) {
                        errorChecking();
                    }

                    cin >> input;
                    input = tolower(input);

                    if (input == 'r') {
                        waitingForInput = false; /* Replays the game */
                    }
                    else if (input == 'b') {
                        waitingForInput = false; /* Goes back to title screen */
                    }
                    else if (input == 'q') {
                        exitGame = true;
                        cout << TITLE << "\n  Game over. Variables cleared. Memory freed. Thanks for playing, human!\n" << RESET << endl;
                        waitingForInput = false; /* Quits the game */
                    }
                    else {
                        errorMessage = "That isn't a valid key, try again: ";
                    }
                }

                if (input == 'b' || exitGame) break;
            }
            break;
        }
		case 'q':
			exitGame = true;
			cout << TITLE << "\n  Game over. Variables cleared. Memory freed. Thanks for playing, human!\n" << RESET << endl; /* Final closing message */
			break;
		case 'i': {
			bool inInstructions = true;

			while (inInstructions) {
				showInstructions();
				if (!errorMessage.empty()) {
					errorChecking();
				}

				cin >> input;
				input = tolower(input);

				if (input == 'b') inInstructions = false; /* Goes back to the title screen */
				else errorMessage = "That isn't a valid key, try again: ";
			}
			break;
		}
		case 's': {
            bool inOptions = true;

            while (inOptions) {
                showStats();
                if (!errorMessage.empty()) {
                    errorChecking();
                }

                cin >> input;
                input = tolower(input);

                if (input == 'b') inOptions = false;
                else errorMessage = "That isn't a valid key, try again: ";
            }
            break;
        }
        case 'o': {
			bool inSettings = true;

			while (inSettings) {
				showSettings();
                if (!errorMessage.empty()) {
                    errorChecking();
                }

                string value;
                cin >> input;
                input = tolower(input);
                if (input == 'n') {
                    cout << "  Enter " << PLAYER1 << "player 1" << RESET << "'s new name: ";
                    cin >> value;
                    p1name = value;
                    savingData();
                }
                else if (input == 'o') {
                    cout << "  Enter " << PLAYER1 << "player 1" << RESET << "'s new piece: ";
                    cin >> value;
                    p1piece = value;
                    savingData();
                }
                else if (input == 'a') {
                    cout << "  Enter " << PLAYER2 << "player 2" << RESET << "'s new name: ";
                    cin >> value;
                    p2name = value;
                    savingData();
                }
                else if (input == 'h') {
                    cout << "  Enter " << PLAYER2 << "player 2" << RESET << "'s new piece: ";
                    cin >> value;
                    p2piece = value;
                    savingData();
                }
				else if (input == 'b') inSettings = false; /* Goes back to the title screen */
				else errorMessage = "That isn't a valid key, try again: ";
			}
			break;
		}
		default:
			errorMessage = "That isn't a valid key, try again: ";
			break;
		}
	}
}
