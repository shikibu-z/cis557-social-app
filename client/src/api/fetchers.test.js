/* eslint-disable consistent-return */
/* eslint-disable no-undef */
const axios = require('axios');
const fetch = require('jest-fetch-mock');

jest.mock('axios');
const lib = require('./fetchers');

describe('[TEST] fetcher unit test with correct data returned', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('user register', () => {
    const data = {
      email: 'test@test.test', username: 'test', password: 'Test@test', gender: 'test',
    };
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 201 }));
    try {
      lib.userRegister(data).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });

  test('user login', () => {
    const data = { username: 'test', password: 'Test@test' };
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
    try {
      lib.userLogin(data).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('profile data', () => {
    const data = {
      userId: 123456,
      username: 'happy123',
      gender: 'female',
      email: 'yip1112@example.com',
      photo: '/tmp/selfie.png',
      interests: [
        'i1',
        'i2',
      ],
      registrationDate: '2010-10-10',
    };
    axios.get.mockImplementationOnce(() => Promise.resolve({ data, status: 200 }));
    try {
      lib.fetchUserProfile(123456).then((res) => {
        expect(res.data.userId).toEqual(123456);
        expect(res.status).toEqual(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('user groups', () => {
    const data = [
      {
        members: 0,
        isJoined: true,
        isAdmin: true,
        group: {
          groupId: 15,
          groupName: 'investing',
          groupIntro: 'this is a page about investing',
          private: 1,
          profilePhoto: '/tmp/your_image.png',
          groupTags: [
            'string',
          ],
          createDate: '2010-01-01',
        },
      },
    ];
    axios.get.mockImplementationOnce(() => Promise.resolve({ data, status: 200 }));
    try {
      lib.fetchUserGroups(123456).then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.length).toBe(1);
      });
    } catch (err) {
      return err;
    }
  });

  test('edit user profile', () => {
    const data = {
      userId: 123456,
      username: 'happy123',
      oldPassword: '12345678',
      newPassword: '12345678',
      photo: '/tmp/selfie.png',
      interests: [
        'i1',
        'i2',
      ],
    };
    axios.put.mockImplementationOnce(() => Promise.resolve({ data, status: 201 }));
    try {
      lib.editUserProfile(123456, data).then((res) => {
        expect(res.status).toBe(201);
        expect(res.data.username).toBe('happy123');
      });
    } catch (err) {
      return err;
    }
  });

  test('delete an account', () => {
    const temp = { data: { id: 1 } };
    axios.delete.mockImplementationOnce(() => Promise.resolve({ status: 201 }));
    try {
      lib.deleteAccount(temp).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });
});

test('create a group', () => {
  const data = {
    groupName: 'investing',
    groupIntro: 'this is a page about investing',
    private: 1,
    profilePhoto: '/tmp/your_image.png',
    groupTags: [
      'string',
    ],
    createDate: {},
  };

  axios.post.mockImplementationOnce(() => Promise.resolve({ data, status: 201 }));
  try {
    lib.createGroup(data).then((res) => {
      expect(res.status).toBe(201);
      expect(res.data.groupName).toBe('investing');
    });
  } catch (err) {
    return err;
  }
});

describe('admins page', () => {
  test('get admins', () => {
    const data = [
      {
        userId: 1,
        email: 'yip1112@example.com',
        username: 'happy123',
        password: 'iamhappy123',
        gender: 'female',
      },
    ];
    axios.get.mockImplementationOnce(() => Promise.resolve({ data, status: 200 }));
    try {
      lib.getAdmins(123).then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.length).toBe(1);
      });
    } catch (err) {
      return err;
    }
  });

  test('remove an admin', () => {
    const data = { userId: 1, groupId: 1 };
    axios.put.mockImplementationOnce(() => Promise.resolve({ status: 201 }));
    try {
      lib.removeAdmin(data).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });

  test('add an admin', () => {
    const data = {
      userId: 12345,
      groupId: 532,
    };
    axios.post.mockImplementationOnce(() => Promise.resolve({ status: 201 }));
    try {
      lib.addAdmin(data).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });

  test('get group members', () => {
    const data = [
      {
        userId: 1,
        email: 'yip1112@example.com',
        username: 'happy123',
        password: 'iamhappy123',
        gender: 'female',
      },
    ];
    axios.get.mockImplementationOnce(() => Promise.resolve({ data, status: 200 }));
    try {
      lib.getGroupMembers(1234).then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.length).toBe(1);
      });
    } catch (err) {
      return err;
    }
  });

  test('get admin notes', () => {
    const data = [{
      idAdminNotification: 1,
      idGroup: 1234,
      createData: '2010-01-10',
      type: 'join',
      read: 0,
      action: 'user requests to join group',
      idUser_Action: 34,
      idPost_Action: 235,
    }];
    axios.get.mockImplementationOnce(() => Promise.resolve({ data, status: 200 }));
    try {
      lib.getAdminNotes(1234).then((res) => {
        expect(res.status).toBe(200);
        expect(res.data.length).toBe(1);
      });
    } catch (err) {
      return err;
    }
  });
});

test('get friends', () => {
  axios.get.mockImplementationOnce(() => Promise.resolve({ status: 200 }));
  try {
    lib.getFriends(123, 43).then((res) => {
      expect(res.status).toBe(200);
    });
  } catch (err) {
    return err;
  }
});

test('get topics', async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(
    { status: 200, data: [{ topic: 'topic1' }] },
  ));
  try {
    lib.getTopics().then((res) => {
      expect(res.status).toBe(200);
      expect(res.data[0].topic).toBe('topic1');
    });
  } catch (err) {
    return err;
  }
});

test('get public groups', async () => {
  const data = '1?topic1=true';
  axios.get.mockImplementationOnce(() => Promise.resolve(
    { status: 200, data: [{ isJoined: false }] },
  ));
  try {
    lib.getPublicGroups(data).then((res) => {
      expect(res.status).toBe(200);
      expect(res.data[0].isJoined).toBe(false);
    });
  } catch (err) {
    return err;
  }
});

test('get group info', async () => {
  axios.get.mockImplementationOnce(() => Promise.resolve(
    {
      status: 200,
      data: {
        members: 0,
        isJoined: true,
        isAdmin: true,
        group: {
          groupId: 123,
          groupName: 'investing',
          private: 1,
          groupInfo: 'all about investing',
          profilePhoto: '/tmp/your_image.png',
          createDate: '11/21/2021 23:24:50',
        },
      },
    },
  ));
  try {
    lib.getGroupInfo(123).then((res) => {
      expect(res.status).toBe(200);
      expect(res.data.group.groupId).toBe(123);
    });
  } catch (err) {
    return err;
  }
});

describe('join/request group', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('test join a group', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.joinRequest({ userId: 123 }, 24).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('test resolve join request', async () => {
    axios.put.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.resolveJoinRequest({ adminNotiId: 123, userId: 124, groupId: 124 }).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('leave group', async () => {
    axios.delete.mockImplementationOnce(() => Promise.resolve(
      { status: 200, message: 'left' },
    ));
    try {
      lib.leaveGroup({ userId: 123, groupId: 12 }).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('invite user', async () => {
    const data = { senderId: 1, receiverId: 2, groupId: 3 };
    axios.post.mockImplementationOnce(() => Promise.resolve(
      { status: 201 },
    ));
    try {
      lib.joinRequest(data).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });
});

describe('posts within a group', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('adding a post', async () => {
    axios.post.mockImplementationOnce(() => Promise.resolve(
      { status: 201 },
    ));
    try {
      lib.addPost(124, {
        userId: 124,
        groupId: 124,
        flagged: 0,
        title: 'title',
        content: 'title',
        attachment: '',
      }).then((res) => {
        expect(res.status).toBe(201);
      });
    } catch (err) {
      return err;
    }
  });

  test('getting all posts', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.getPosts(24, 124, 1).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('getting all posts by id', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.getPostById(1242, 353, 346).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('getting comments of a post', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.getCommentsOfPost(124, 353, 235).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('delete comment', async () => {
    axios.delete.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.deleteComment(124, 43, 242).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('post comment', async () => {
    const data = { userId: 24, content: 'agdg' };
    axios.post.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.postComment(123, 53, data).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('hide post', async () => {
    const data = { userId: 12, flag: false, hide: true };
    axios.put.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.hideOrFlagPost(43, 325, data).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });

  test('delete post', async () => {
    axios.put.mockImplementationOnce(() => Promise.resolve(
      { status: 204 },
    ));
    try {
      lib.deletePost(1, 1, 1).then((res) => {
        expect(res.status).toBe(204);
      });
    } catch (err) {
      return err;
    }
  });

  test('get sorted groups', async () => {
    const query = 'post?basketball=true';
    axios.get.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.getSortedGroups(query).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });
});

describe('get group analytic', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('get group analytics', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve(
      { status: 200 },
    ));
    try {
      lib.getGroupAnalytic(1001).then((res) => {
        expect(res.status).toBe(200);
      });
    } catch (err) {
      return err;
    }
  });
});
