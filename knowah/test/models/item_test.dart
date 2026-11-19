// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// This file does not exist yet, that is the point of TDD
// The test is written first, then the code is written to make it pass
import 'package:knowah/models/item.dart';

void main() {
    // group() bundles related tests together under one name
    group('Item title rules', () {
        // TC01: an empty title must be rejected
        test('TC01: Rejects an empty title', () {
            // expected output is an Item with '' throws an error
            expect(() => Item(title: ''), throwsArgumentError);
        });

        // TC02: a title longer than 80 characters must be rejected
        test('TC02: Rejects a title over 80 characters', () {
            // 'a' * 81 makes a string of 81 letters
            expect(() => Item(title: 'a' * 81), throwsArgumentError);
        });

        // A normal title should work and be stored
        test('Accepts a valid title', () {
            final item = Item(title: 'Double Jump');
            expect(item.title, 'Double Jump');
        });

        // TC09: a new Item starts as a Draft, and keeps any status it is given
        // Not status given so it should be Draft
        test('TC09: Item status defaults to Draft and can be set', () {
            final plain = Item(title: 'Double Jump');
            expect(plain.status, ItemStatus.draft);

            // A status that is given should be kept
            final active = Item(title: 'Double Jump', status: ItemStatus.active);
            expect(active.status, ItemStatus.active);
        });
    });
}