// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// This file does not exist yet, that is the purpose of TDD
// The test is written first, then the code is written to make it pass
import 'package:knowah/models/project.dart';

void main() {
    // group() bundles related tests together under one name
    // Group 1: everything about the name
    group('Project name rules', () {
        // TC20: an empty name must be rejected
        test('TC20: Rejects an empty name', () {
            // expected output is a Project with '' throws an error
            expect(() => Project(name: ''), throwsArgumentError);
        });

        // TC21: a name longer than 80 characters must be rejected
        test('TC21: Rejects a name over 80 characters', () {
            // 'a' * 81 makes a string of 81 letters
            expect(() => Project(name: 'a' * 81), throwsArgumentError);
        });

        // A normal name should wokr and be stored
        test('Accepts a valid name', () {
            final project = Project(name: 'Side-Scroller');
            expect(project.name, 'Side-Scroller');
        });
    });

    // Group 2: everything about the ID
    group('Project ID rules', () {
        // TC22: every new Project gets its own unique ID
        test('TC22a: Each new Project gets its own unique ID', () {
            final first = Project(name: 'Side-Scroller');
            final second = Project(name: 'Card Battler');

            // The ID is never empty
            expect(first.id, isNotEmpty);
            // Two projects never share an ID, even with the same name
            expect(first.id, isNot(second.id));
        });

        // TC22 (rule): an Id that is give is kept, which is needed when loading from the database
        test('TC22b: An ID that is given is kept', () {
            final project = Project(name: 'Side-Scroller', id: 'prod-123');
            expect(project.id, 'prod-123');
        });
    });
}