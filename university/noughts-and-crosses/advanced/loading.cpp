#include <iostream>
#include <string>
#include <fstream>
#include "json.hpp"

using namespace std;
using json = nlohmann::json;

extern string p1name;
extern string p2name;
extern string p1piece;
extern string p2piece;
extern string ERRORS;
extern string RESET;
extern string TITLE;
extern int p1wins;
extern int p1losses;
extern int p2wins;
extern int p2losses;
extern int totalgames;
extern int totaldraws;

void savingData();

void loadingData() {
    json stats;

    /* Creates json with default variables, if one doesn't exist */
    ifstream checkFile("statistics.json");
    if (!checkFile.is_open()) {
        savingData();
    } else {
        checkFile.close();
    }

    ifstream file("statistics.json");
    if (!file.is_open()) {
        cerr << ERRORS << "  Failed to read 'statistics.json': " << RESET << endl;
    }

    try {
        file >> stats;
        file.close();

        /* Loads saved variables for player 1 */
        if (stats.contains("player1")) {
            if (stats["player1"].contains("name")) {
                p1name = stats["player1"]["name"].get<string>();
            }
            if (stats["player1"].contains("piece")) {
                p1piece = stats["player1"]["piece"].get<string>();
            }
            if (stats["player1"].contains("wins")) {
                p1wins = stats["player1"]["wins"].get<int>();
            }
            if (stats["player1"].contains("losses")) {
                p1losses = stats["player1"]["losses"].get<int>();
            }
        }

        /* Loads saved variables for player 2 */
        if (stats.contains("player2")) {
            if (stats["player2"].contains("name")) {
                p2name = stats["player2"]["name"].get<string>();
            }
            if (stats["player2"].contains("piece")) {
                p2piece = stats["player2"]["piece"].get<string>();
            }
            if (stats["player2"].contains("wins")) {
                p2wins = stats["player2"]["wins"].get<int>();
            }
            if (stats["player2"].contains("losses")) {
                p2losses = stats["player2"]["losses"].get<int>();
            }
        }

        /* Loads saved variables for overall gameplay */
        if (stats.contains("overall")) {
            if (stats["overall"].contains("total_games")) {
                totalgames = stats["overall"]["total_games"].get<int>();
            }
            if (stats["overall"].contains("draws")) {
                totaldraws = stats["overall"]["draws"].get<int>();
            }
        }
    } catch (json::parse_error & e) {
        /* Explains where errors are coming from when loading data */
        cerr << ERRORS << "  Failed to parse 'statistics.json': " << RESET << e.what() << endl;
        cout << TITLE << "  Using default variables." << RESET << endl;
    }
}
