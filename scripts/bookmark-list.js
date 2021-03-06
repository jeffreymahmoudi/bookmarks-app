const bookmarkList = (() => {
  const generateError = (err) => {
    let message = '';
    if (err.responseJSON && err.responseJSON.message) {
      message = err.responseJSON.message;
    } else {
      message = `${err.code} Server Error`;
    }

    return `
      <section class="error-content">
        <button id="cancel-error">X</button>
        <p>${message}</p>
      </section>
    `;
  };

  const generateItemElement = (item) => {
    if(item.id === store.editingId) {
      return `
      <li class="item-element js-item-element" data-item-id="${item.id}">
        <form class="js-edit-item">
          <label for="bookmark-item-title">Title: </label>
          <input class="bookmark-item-title js-bookmark-item-title" type="text" value="${item.title}" /><br>
          <label for="bookmark-item-url">Url: </label>
          <input class="bookmark-item-url js-bookmark-item-url" type="text" value="${item.url}" /><br>
          <label for="bookmark-item-rating">Rating: </label>
          <input class="bookmark-item-rating js-bookmark-item-rating" type="number" min="0" max="5" value="${(item.rating ? item.rating : 0)}" /><br>
          <label for="bookmark-item-desc">Description: </label>
          <textarea class="bookmark-item-desc js-bookmark-item-desc">${(item.desc) ? item.desc : ''}</textarea><br>
          <button type="reset">Cancel</button>
          <button type="submit">Update</button>
        </form>
      </li>
      `;
    }
    else
    {
      return `
      <li class="item-element js-item-element" data-item-id="${item.id}">
        <div class="item-title">${item.title}</div>
        <div class="item-title">${(item.rating && item.rating > 0 ? item.rating + " stars" : "No Rating")}</div>
        <p>${(item.desc ? item.desc : "No Description")}</p>
        <a href="${item.url}" target="_blank">Visit Site</a>
        <button class="bookmark-item-delete js-item-delete">Remove Bookmark</button>
        <button class="bookmark-item-edit js-item-edit">Edit Bookmark</button>
      </li>
      `;
    }
  };

  const generateBookmarkItemsString = (bookmarkList) => {
    const items = store.items.map((item) => {
      if(!(item.rating >= store.rating)) {
        return '';
      }

      return generateItemElement(item);
    });
    
    return items.join("");
  };

  const render = () => {
    console.log("`render` ran");
    console.log(store);

    if (store.error) {
      const el = generateError(store.error);
      $('.error-container').html(el);
    } else {
      $('.error-container').empty();
    }

    if (store.adding) {
      $('.bookmark-add-controls').removeClass('hidden');
      $('.js-bookmark-list-entry-title').val("");
      $('.js-bookmark-list-entry-url').val("");
      $('.js-bookmark-list-entry-title').focus();
    }
    else {
      $('.bookmark-add-controls').addClass('hidden');
    }

    $('.js-list-rating').val(store.rating);
    
    const bookmarkListItemsString = generateBookmarkItemsString(store.items);
    $('.js-bookmark-list').html(bookmarkListItemsString);
  };

  const handleCancelItemSubmit = () => {
    $('#js-bookmark-list-form').on("reset", ((event) => {
      store.setAdding(false);
      store.setError(false);
      render();
    }));
  };

  const handleNewItemSubmit = () => {
    $('#js-bookmark-list-form').submit((event) => {
      event.preventDefault();
      const newItemTitle = $('.js-bookmark-list-entry-title').val();
      const newItemUrl = $('.js-bookmark-list-entry-url').val();
      api.createItem({title: newItemTitle, url: newItemUrl},
        (newItem) => {
          store.addItem(newItem);
          store.setAdding(false);
          store.setError(null);
          render();
        },
        (err) => {
          store.setError(err);
          render();
        }
      );
    });
  };

  const handleAddItemClicked = () => {
    $('.js-list-add').click((event) => {
      store.setAdding(true);
      render();
    });
  };

  const handleMinimumRatingChanged = () => {
    $('.js-list-rating').on('change', (event) => {
      const rating = parseInt($('.js-list-rating').val());
      store.setRating(rating);
      render();
    });
  };

  function getItemIdFromElement(item) {
    return $(item)
      .closest('.js-item-element')
      .data('item-id');
  }

  const handleEditItemClicked = () => {
    $('.js-bookmark-list').on('click', '.js-item-edit', event => {
      const id = getItemIdFromElement(event.currentTarget);
      store.setEditingId(id);
      render();
    });
  };

  const handleCancelEditItemSubmit = () => {
    $('.js-bookmark-list').on("reset", ((event) => {
      store.setEditingId('');
      store.setError(false);
      render();
    }));
  };

  const handleEditItemSubmit = () => {
    $('.js-bookmark-list').on('submit', '.js-edit-item', (event) => {
      event.preventDefault();
      const id = getItemIdFromElement(event.currentTarget);
      const itemTitle = $('.js-bookmark-item-title').val();
      const itemUrl = $('.js-bookmark-item-url').val();
      const itemRating = $('.js-bookmark-item-rating').val();
      const itemDesc = $('.js-bookmark-item-desc').val();
      const itemData = { title: itemTitle, url: itemUrl};
      if(itemRating > 0)
        itemData.rating = itemRating;
      if(itemDesc.length > 0)
        itemData.desc = itemDesc;

      api.updateItem(id, itemData,
        (response) => {
          store.findAndUpdate(id, itemData);
          store.setEditingId('');
          render();
        },
        (err) => {
          store.setError(err);
          render();
        });
    });
  };

  const handleDeleteItemClicked = () => {
    $('.js-bookmark-list').on('click', '.js-item-delete', event => {
      const id = getItemIdFromElement(event.currentTarget);
      api.deleteItem(id, () => {
        store.findAndDelete(id);
        store.setEditingId('');
        render();
      });
    });
  };

  const handleCloseError = () => {
    $('.error-container').on('click', '#cancel-error', () => {
      store.setError(null);
      render();
    });
  };

  const bindEvenHandlers = () => {
    handleAddItemClicked();
    handleMinimumRatingChanged();
    handleNewItemSubmit();
    handleEditItemSubmit();
    handleCancelEditItemSubmit();
    handleCancelItemSubmit();
    handleEditItemClicked();
    handleDeleteItemClicked();
    handleCloseError();    
  };

  return {
    render,
    bindEvenHandlers,
  };

})();