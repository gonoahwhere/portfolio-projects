// drift/native.dart lets us make a database that lives only in memory
import 'package:drift/native.dart';

// flutter_test gives us test(), expect() and the checks used below
import 'package:flutter_test/flutter_test.dart';

// The database that is being tested, the items in it don't exist yet
import 'package:knowah/database/app_db.dart';

// The Item being saved into it
import 'package:knowah/models/item.dart';

void main() {
    // 'late' means this gets its value later, in setUp below
    late AppDB database;

    // setUp runs before every test, so each test starts wtih a fresh empty database
    setUp(() {
        database = AppDB(NativeDatabase.memory());
    });

    // tearDown runs after every test and closes the databas
    tearDown(() async {
        await database.close();
    });

    // TC30: an item saves to the database and can be loaded again
    test('TC30a: A saved item can be loaded again', () async {
        // An item that beloongs to a project
        final item = Item(
            title: 'Double Jump',
            status: ItemStatus.active,
            projectId: 'project-1',
        );

        // Put the item in the database
        await database.saveItem(item);

        // Ask for the items of that project, there should be exactly one
        final loaded = await database.getItemsForProject('project-1');
        expect(loaded.length, 1);

        // The loaded item should have everything we saved
        // it is a new Item object, so the details are compared, not the object itself
        expect(loaded.first.id, item.id);
        expect(loaded.first.title, 'Double Jump');
        expect(loaded.first.status, ItemStatus.active);
        expect(loaded.first.projectId, 'project-1');
    });

    // TC30 (rule): an item with no project is refused, because it has nowhere to live
    test('TC30b: An item without a project is refused', () async {
        // No projectId given, so this item belongs to nothing
        final item = Item(title: 'Double Jump');

        // expectLater waits for the save to finish, then checks that it threw an error
        await expectLater(database.saveItem(item), throwsArgumentError);
    });

    // TC30 (extra check): loading items for one project leaves out the other projects items
    // Written after the code, as the filter was built with TC30a/TC30b
    test('TC30c: Loading items returns only the items of that project', () async {
        // Two items in two different projects
        await database.saveItem(Item(title: 'Double Jump', projectId: 'project-1'));
        await database.saveItem(Item(title: 'Card Draw', projectId: 'project-2'));

        // Ask for project 1's items only
        final loaded = await database.getItemsForProject('project-1');

        // Only the project 1 item should come back
        expect(loaded.length, 1);
        expect(loaded.first.title, 'Double Jump');
    });
}