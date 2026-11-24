// Flutter's ready-made building blocks
import 'package:flutter_test/flutter_test.dart';

// The Item made in another file
import 'package:knowah/models/item.dart';

// This file doesn't exist yet, so the test with fail (Red)
import 'package:knowah/models/link.dart';


void main() {
    // group() bundles related tests together under one name
    // Group 1: everything about links
    group('Link rules', () {
        // TC15: a link keeps its type and the two items it joins
        test('TC15a: Link keeps its type and both items', () {
            final doubleJump = Item(title: 'Double Jump');
            final level2 = Item(title: 'Level 2');

            final link = Link(
                type: LinkType.introducedIn,
                from: doubleJump,
                to: level2,
            );

            expect(link.type, LinkType.introducedIn);
            expect(link.from, doubleJump);
            expect(link.to, level2);
        });

        // TC15 (rule): an item cannot link to itself
        test('TC15b: Link rejects linking an item to itself', () {
            final doubleJump = Item(title: 'Double Jump');

            // Expect creating this link to throw an error
            expect(
                () => Link(
                    type: LinkType.relatedTo,
                    from: doubleJump,
                    to: doubleJump,
                ),
                throwsArgumentError,
            );
        });
    });
}