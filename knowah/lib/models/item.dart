
// The possible statuses an Item can have
// An enum is a fixed list of choices, so nobody can type a status that doesn't exist
enum ItemStatus { draft, active, done, cut }

// An Item is the general form every design note starts from
class Item {
    // 'final' means the title is set once when the Item is created
    final String title;
    final ItemStatus status;

    // The constructor runs when Item(title: '...') is written
    // The code after the colon is an 'initialiser list': it runs
    // checks before the Item is created
    Item({required this.title, this.status = ItemStatus.draft}) {
        // Reject an empty title (rule: title is required)
        if (title.isEmpty) {
            throw ArgumentError('Title cannot be empty');
        }

        // Reject a title over 80 characters (rule: max 80)
        if (title.length > 80) {
            throw ArgumentError('title cannot be longer than 80 characters');
        }
    }
}