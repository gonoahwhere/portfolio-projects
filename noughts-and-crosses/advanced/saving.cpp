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

void savingData() {
    json stats;

    /* Stats for Player 1 */
    stats["player1"]["name"] = p1name;
    stats["player1"]["piece"] = p1piece;
    stats["player1"]["wins"] = p1wins;
    stats["player1"]["losses"] = p1losses;

    /* Stats for Player 2 */
    stats["player2"]["name"] = p2name;
    stats["player2"]["piece"] = p2piece;
    stats["player2"]["wins"] = p2wins;
    stats["player2"]["losses"] = p2losses;

    /* Overall stats */
    stats["overall"]["total_games"] = totalgames;
    stats["overall"]["draws"] = totaldraws;

    /* Writes to a file called statistics.json*/
    ofstream file("statistics.json");

    if (!file) {
        cerr << ERRORS << "Failed to load the file 'statistics.json'" << RESET << endl;
    }

    file << stats.dump(4);
    file.close();
}
