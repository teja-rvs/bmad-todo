# frozen_string_literal: true

require "test_helper"

class TaskTest < ActiveSupport::TestCase
  test "valid with title present" do
    task = Task.new(title: "A task", completed: false)
    assert task.valid?
  end

  test "invalid without title" do
    task = Task.new(title: nil, completed: false)
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "invalid with blank title" do
    task = Task.new(title: "   ", completed: false)
    assert_not task.valid?
    assert_includes task.errors[:title], "can't be blank"
  end

  test "invalid with title over 255 characters" do
    task = Task.new(title: "x" * 256, completed: false)
    assert_not task.valid?
    assert_includes task.errors[:title], "is too long (maximum is 255 characters)"
  end

  test "completed defaults to false when not set" do
    task = Task.new(title: "A task")
    assert_equal false, task.completed
  end
end
