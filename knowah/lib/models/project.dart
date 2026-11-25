// Gives access to Random, used to make the ID
import 'dart:math';

// A Project is the general form every new project starts from
class Project {
    // 'final' means the name is set once when the Project is created
    // The ID is hidden from the user, but the database and sync need it
    final String id;
    final String name;

    // The constructor runs when Project(name: '...') is written
    // id is optional, a new Project gets a fresh one, and a Project 
    // loaded from the database passes its saved one in
    // The code after the colon is an 'initialiser list': it runs
    // checks before the Project is created
    Project({
        String? id,
        required this.name,
    }) : id = id ?? _newId() {
        // Reject any empty name (rule: name is required)
        if (name.isEmpty) {
            throw ArgumentError('Name cannot be empty');
        }

        // Reject a title over 80 characters (rule: max 80)
        if (name.length > 80) {
            throw ArgumentError('Name cannot be longer than 80 characters');
        }
    }

    // Makes a new ID from the current time plus a random number
    // The time keeps IDs different over time, the random part keeps two
    // projects made at the same moment, or on different devices different
    // 'static' means it belongs to the Project class itself, not to one Project
    static String _newId() {
        final time = DateTime.now().microsecondsSinceEpoch;
        final random = Random().nextInt(1 << 32);
        return '$time-$random';
    }
}