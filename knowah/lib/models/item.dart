// Gives access to Random, used to make the ID
import 'dart:math';

// The possible statuses an Item can have
// An enum is a fixed list of choices, so nobody can type a status that doesn't exist
enum ItemStatus { draft, active, done, cut }

// An Item is the general form every design note starts from
class Item {
    // 'final' means the title is set once when the Item is created
    // The ID is hidden from the user, but the database and sync need it
    final String id;
    final String title;
    final ItemStatus status;

    // When the item was made
    final DateTime createdAt;

    // When hte Item was last changed (same as createdAt for a new Item)
    // 'late final' means it is set once, inside teh constructor body below
    late final DateTime editedAt;

    // The constructor runs when Item(title: '...') is written
    // id is optional, a new Item gets a fresh one, and an Item 
    // loaded from the database passes its daved one in
    // The code after the colon is an 'initialiser list': it runs
    // checks before the Item is created
    Item({
        String? id,
        required this.title,
        this.status = ItemStatus.draft,
        DateTime? createdAt,
        DateTime? editedAt,
    }) : id = id ?? _newId(),
        createdAt = createdAt ?? DateTime.now() {
            // A new Item has not been edited yet, so editedAt starts the same as createdAt
            this.editedAt = editedAt ?? this.createdAt;

            // Reject any empty title (rule: title is required)
            if (title.isEmpty) {
                throw ArgumentError('Title cannot be empty');
            }

            // Reject a title over 80 characters (rule: max 80)
            if (title.length > 80) {
                throw ArgumentError('Title cannot be longer than 80 characters');
            }
        }

    // Makes a new ID from the current time plus a random number
    // The time keeps IDs different over time, the ranodm part keeps two
    // items made at the same moment, or on different devices different
    // 'static' means it belongs to the Item class itself, not to one Item
    static String _newId() {
        final time = DateTime.now().microsecondsSinceEpoch;
        final random = Random().nextInt(1 << 32);
        return '$time-$random';
    }
}