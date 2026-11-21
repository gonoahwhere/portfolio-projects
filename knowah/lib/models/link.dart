// The Item this link joins
import 'package:knowah/models/item.dart';

// The possible link types
// An enum is a fixed list of choices, so nobody can type a link type that doesn't exist
enum LinkType { introducedIn, appearsIn, blocks, fixes, relatedTo }

// A Link joins two items, for example Double Jump 'Introduced In' Level 2
class Link {
    // 'final' means these are set once the Link is created
    final LinkType type;
    // The item the link starts from
    final Item from;
    // The item the link points to
    final Item to;

    // The constructor runs when Link(type: ..., from: ..., to: ...) is written
    Link({required this.type, required this.from, required this.to}) {
        // Reject linking an item to itself
        // identical() checks it is the very same item, not just one with the same title
        if (identical(from, to)) {
            throw ArgumentError('An item cannot link to itself');
        }
    }
}