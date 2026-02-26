# frozen_string_literal: true

require "test_helper"

class TasksDeleteTest < ActionDispatch::IntegrationTest
  CORS_ORIGIN = ENV.fetch("CORS_ORIGIN", "http://localhost:8080")

  test "DELETE /tasks/:id with valid id returns 204 No Content" do
    task = Task.create!(title: "To delete", completed: false)
    delete "/tasks/#{task.id}"
    assert_response :no_content
    assert_equal 204, response.status
    assert response.body.blank?
  end

  test "DELETE /tasks/:id removes the task from the database" do
    task = Task.create!(title: "Will be gone", completed: false)
    assert_difference("Task.count", -1) do
      delete "/tasks/#{task.id}"
    end
    assert_nil Task.find_by(id: task.id)
  end

  test "DELETE /tasks/:id removes task from GET /tasks listing" do
    task = Task.create!(title: "Disappearing task", completed: false)
    get "/tasks"
    ids_before = response.parsed_body["tasks"].map { |t| t["id"] }
    assert_includes ids_before, task.id

    delete "/tasks/#{task.id}"
    assert_response :no_content

    get "/tasks"
    ids_after = response.parsed_body["tasks"].map { |t| t["id"] }
    assert_not_includes ids_after, task.id
  end

  test "DELETE /tasks/:id with non-existent id returns 404 and error body" do
    non_existent_id = (Task.maximum(:id) || 0) + 99_999
    delete "/tasks/#{non_existent_id}"
    assert_response :not_found
    assert_equal 404, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_equal "Task not found", json["error"]
  end

  test "DELETE /tasks/:id with invalid id format returns 404" do
    delete "/tasks/abc"
    assert_response :not_found
    assert_equal 404, response.status

    json = response.parsed_body
    assert json.key?("error")
    assert_equal "Task not found", json["error"]
  end

  test "DELETE /tasks/:id returns CORS header for frontend origin" do
    task = Task.create!(title: "CORS DELETE", completed: false)
    delete "/tasks/#{task.id}", headers: { "Origin" => CORS_ORIGIN }
    assert_response :no_content
    assert_equal CORS_ORIGIN, response.headers["Access-Control-Allow-Origin"]
  end

  test "DELETE /tasks/:id on completed task returns 204" do
    task = Task.create!(title: "Completed to delete", completed: true)
    delete "/tasks/#{task.id}"
    assert_response :no_content
    assert_nil Task.find_by(id: task.id)
  end

  test "DELETE /tasks/:id does not affect other tasks" do
    keep = Task.create!(title: "Keep me", completed: false)
    remove = Task.create!(title: "Remove me", completed: false)

    delete "/tasks/#{remove.id}"
    assert_response :no_content

    assert Task.find_by(id: keep.id)
    assert_nil Task.find_by(id: remove.id)
  end
end
