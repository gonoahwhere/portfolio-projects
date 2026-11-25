// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// This file does not exist yet, that is the purpose of TDD
// The test is written first, then the code is written to make it pass
import 'package:knowah/models/item.dart';

void main() {
    // group() bundles related tests together under one name
    // Group 1: everything about the title
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
    });

    // Group 2: everything about the status
    group('Item status rules', () {
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

    // Group 3: everyhing about the ID
    group('Item ID rules', () {

        // TC18: every new Item gets its own unique ID
        test('TC18a: Each new Item gets its own unique ID', () {
            final first = Item(title: 'Double Jump');
            final second = Item(title: 'Double Jump');

            // The ID is never empty
            expect(first.id, isNotEmpty);
            // Two items never share an ID, even with the same title
            expect(first.id, isNot(second.id));
        });

        // TC18 (rule): an ID that is given is kept, which is needed when loading from the database
        test('TC18b: An ID that is given is kept', () {
            final item = Item(title: 'Double Jump', id: 'abc-123');
            expect(item.id, 'abc-123');
        });
    });

    // Group 4: everything about the dates
    group('Item date rules', () {
        // TC19: a new Item records when it was created and last edited
        test('TC19a: A new Item records when it was created and edited', () {
            // Note the time just before and just after making the Item
            final before = DateTime.now();
            final item = Item(title: 'Double Jump');
            final after = DateTime.now();

            // The created time sits between those two moments
            expect(item.createdAt.isBefore(before), isFalse);
            expect(item.createdAt.isAfter(after), isFalse);

            // A brand new Item has not been edited yet, so both times match
            expect(item.editedAt, item.createdAt);
        });

        // TC19 (rule): dates that are given are kept, which is needed when loading from the database
        test('TC19b: Dates that are given are kept', () {
            final earlier = DateTime(2026, 11, 1);
            final later = DateTime(2026, 11, 14);
            final item = Item(title: 'Double Jump', createdAt: earlier, editedAt: later);

            expect(item.createdAt, earlier);
            expect(item.editedAt, later);
        });
    });
}