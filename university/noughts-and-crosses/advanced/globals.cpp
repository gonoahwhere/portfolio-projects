#include <string>
#include <iostream>

using namespace std;

/* VARIABLES */
string grid[3][3] = {}; /* Generates empty cells at the beginning of a game */
int currentTurn = 1; /* Player 1 starts first */
int filled = 0; /* No cells are filled at the start of a game */
string errorMessage = ""; /* Empty string, useful for things like cells are already in use */
string recentTurn; /* Stores the most recent turn */
bool hasWon = false; /* For determining a winner */
char input; /* Stores the arguments the user types */
bool isGameActive = true; /* Tracks if the game is active or not */
bool exitGame = false; /* Trakcs if the user wants to exit the game */
string p1piece = "X"; /* Changeable piece for player 1 */
string p2piece = "O"; /* Changeable piece for player 2*/
string p1name = "Player 1"; /* Changeable pname for player 1*/
string p2name = "Player 2"; /* Changeable name for player 2 */
bool pieceSelect = true; /* Tracks if the game is in piece select mode */

/* Set game and player stats to 0 when save file is created */
int p1wins = 0; 
int p1losses = 0;
int p2wins = 0;
int p2losses = 0;
int totalgames = 0;
int totaldraws = 0;

/* COLOURS */
string PLAYER1 = "\033[38;5;083m";
string PLAYER2 = "\033[94m";
string BORDER = "\033[38;5;247m";
string BACK = "\033[38;5;226m";
string TIE = "\033[38;5;196m";
string TITLE = "\033[38;5;220m";
string ERRORS = "\033[91m";
string RESET = "\033[0m";
string SUB = "\033[95m";
string SUB2 = "\033[38;5;087m";