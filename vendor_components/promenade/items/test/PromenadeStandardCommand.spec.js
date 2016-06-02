(function () {
    'use strict';

    describe('promenade.items.command', function () {

        beforeEach(module('promenade.items.command'));

        describe('PromenadeStandardCommand', function () {
            var PromenadeStandardCommand;

            beforeEach(inject(function(_PromenadeStandardCommand_) {
                PromenadeStandardCommand = _PromenadeStandardCommand_;
            }));

            describe("creates PromenadeStandardCommand", function () {

                it("without dropdown options", function () {

                    var data = {
                        MSG_KEY: "test_key",
                        INPUT: "test_input",
                        LABEL: "test_label",
                        REQUIRED: true,
                        DEFAULT: "test",
                        HIDDEN: true
                    };

                    var protocol = {};

                    var command = new PromenadeStandardCommand(data, "TestItem", protocol);

                    expect(command.msg_key).toBe(data.MSG_KEY);
                    expect(command.input).toBe(data.INPUT);
                    expect(command.label).toBe(data.LABEL);
                    expect(command.required).toBe(data.REQUIRED);
                    expect(command.default).toBe(data.DEFAULT);
                    expect(command.hidden).toBe(data.HIDDEN);
                    expect(command.item_name).toBe("TestItem");
                    expect(command.protocol).toBe(protocol);
                    expect(command.options).toBeUndefined();

                });

                it("with dropdown options and no subfields", function () {
                    var data = {
                        MSG_KEY: "test_key",
                        INPUT: "test_input",
                        LABEL: "test_label",
                        REQUIRED: true,
                        DEFAULT: "test",
                        HIDDEN: true,
                        DROPDOWN_OPTIONS: [
                            "test_string",
                            ["test_option", "TEST_OPTION"]
                        ]
                    };

                    var protocol = {};

                    var command = new PromenadeStandardCommand(data, "TestItem", protocol);

                    expect(command.msg_key).toBe(data.MSG_KEY);
                    expect(command.input).toBe(data.INPUT);
                    expect(command.label).toBe(data.LABEL);
                    expect(command.required).toBe(data.REQUIRED);
                    expect(command.default).toBe(data.DEFAULT);
                    expect(command.hidden).toBe(data.HIDDEN);
                    expect(command.item_name).toBe("TestItem");
                    expect(command.protocol).toBe(protocol);

                    expect(command.options).toEqual([
                        {name: "test_string", value: "test_string", sub_fields: undefined},
                        {name: "test_option", value: "TEST_OPTION", sub_fields: undefined}
                    ]);
                    
                });

                it("with dropdown options and subfields", function () {
                    var data = {
                        MSG_KEY: "test_key",
                        INPUT: "test_input",
                        LABEL: "test_label",
                        REQUIRED: true,
                        DEFAULT: "test",
                        HIDDEN: true,
                        DROPDOWN_OPTIONS: [["test_option", "TEST_OPTION"]],
                        DROPDOWN_SUB_FIELDS: [[{
                            MSG_KEY: "test_key",
                            INPUT: "test_input",
                            LABEL: "test_label",
                            REQUIRED: true,
                            DEFAULT: "test",
                            HIDDEN: true
                        }]]
                    };

                    var protocol = {};

                    var command = new PromenadeStandardCommand(data, "TestItem", protocol);

                    expect(command.msg_key).toBe(data.MSG_KEY);
                    expect(command.input).toBe(data.INPUT);
                    expect(command.label).toBe(data.LABEL);
                    expect(command.required).toBe(data.REQUIRED);
                    expect(command.default).toBe(data.DEFAULT);
                    expect(command.hidden).toBe(data.HIDDEN);
                    expect(command.item_name).toBe("TestItem");
                    expect(command.protocol).toBe(protocol);

                    var ref = command.options[0].sub_fields[0];
                    var sub = new PromenadeStandardCommand(data.DROPDOWN_SUB_FIELDS[0][0]);

                    // Deleting function references as the won't ever be equal.
                    delete ref.generateAutocompleteEntries;
                    delete ref.generateInterpreterWrappers;
                    delete sub.generateAutocompleteEntries;
                    delete sub.generateInterpreterWrappers;

                    expect(ref).toEqual(sub);

                });

            });

        });

    });

}());