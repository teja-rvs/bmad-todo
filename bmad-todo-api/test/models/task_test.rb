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
end
